from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client.get_database("test")
collection = db.todos

# Helper to format MongoDB docs
def todo_helper(todo) -> dict:
    return {
        "_id": str(todo["_id"]),
        "text": todo["text"],
        "completed": todo.get("completed", False),
        "order": todo.get("order", 0)
    }

@app.get("/python/api/todos")
async def get_todos():
    todos = []
    cursor = collection.find().sort("order", 1)
    async for todo in cursor:
        todos.append(todo_helper(todo))
    return todos

@app.post("/python/api/todos")
async def create_todo(payload: dict = Body(...)):
    count = await collection.count_documents({})
    new_todo = {
        "text": payload["text"],
        "completed": False,
        "order": count
    }
    result = await collection.insert_one(new_todo)
    new_todo["_id"] = str(result.inserted_id)
    return new_todo

@app.delete("/python/api/todos/{item_id}")
async def delete_todo(item_id: str):
    await collection.delete_one({"_id": ObjectId(item_id)})
    return {"message": "Deleted successfully"}

@app.patch("/python/api/todos/{item_id}")
async def toggle_todo(item_id: str):
    todo = await collection.find_one({"_id": ObjectId(item_id)})
    new_status = not todo.get("completed", False)
    await collection.update_one({"_id": ObjectId(item_id)}, {"$set": {"completed": new_status}})
    return {"_id": item_id, "completed": new_status}

@app.put("/python/api/todos/{item_id}")
async def update_todo(item_id: str, payload: dict = Body(...)):
    updated_todo = await collection.find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": {"text": payload["text"]}},
        return_document=True
    )
    return todo_helper(updated_todo)

@app.post("/python/api/todos/reorder")
async def reorder_todos(payload: dict = Body(...)):
    await collection.update_one({"_id": ObjectId(payload["id1"])}, {"$set": {"order": payload["order1"]}})
    await collection.update_one({"_id": ObjectId(payload["id2"])}, {"$set": {"order": payload["order2"]}})
    return {"message": "Reordered"}

@app.get("/python/api/get-length")
async def get_length():
    # 1. Fetch all todos from the same collection
    cursor = collection.find()
    todos = [todo async for todo in cursor]
    
    if not todos:
        return {"average-length": 0}
    
    # 2. Calculate the average length of the 'text' field
    total_chars = sum(len(t.get("text", "")) for t in todos)
    avg = total_chars / len(todos)
    
    return {"average-length": avg}    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)