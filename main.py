from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Server": "HD Masale Backend",
            "status": "running",
            "Docs" : "/docs",
            "Motto" : "Get going",
            "Remember" : "Balidan Param Dharma"}
