from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    azure_openai_endpoint: str
    azure_openai_api_key: str
    azure_openai_deployment: str = "gpt-4o"
    inbox_folder: str = "/app/data/inbox"
    database_url: str = "sqlite:////app/data/labefficient.db"

    class Config:
        env_file = ".env"


settings = Settings()
