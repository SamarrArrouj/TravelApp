import os

class Config:
    SECRET_KEY = "super-secret-key"
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:@localhost:3307/travel_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'Samar.arouj2020@gmail.com'
    MAIL_PASSWORD = 'uowc jddo gclj xpnc'
