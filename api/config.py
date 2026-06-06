import os


class Settings:
    beehiiv_api_key: str = os.getenv("BEEHIIV_API_KEY", "")
    beehiiv_publication_id: str = os.getenv("BEEHIIV_PUBLICATION_ID", "")
    project_id: str = os.getenv("PROJECT_ID", "")
    allowed_origins: list[str] = os.getenv(
        "ALLOWED_ORIGINS", "https://edgarsierra.com"
    ).split(",")


settings = Settings()
