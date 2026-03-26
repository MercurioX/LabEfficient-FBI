from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import import_router, labs_router
from app.core.database import SessionLocal
from app.core.seed import run_seed

app = FastAPI(title="LabEfficient API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(import_router.router, prefix="/api/import")
app.include_router(labs_router.router, prefix="/api/labs")


@app.on_event("startup")
def on_startup() -> None:
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
