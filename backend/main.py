from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth

app = FastAPI(
    title="Plateforme de Livraison Multi-Vendeurs",
    description="API pour la gestion des commandes, vendeurs et livreurs",
    version="1.0.0"
)

# Configuration du CORS pour permettre au Front-end de communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API de gestion de livraisons"}