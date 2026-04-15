from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

# Créer les tables au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plateforme de Livraison Multi-Vendeurs",
    description="API REST — Architecture n-tiers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/api/health")
def health():
    return {"status": "OK"}