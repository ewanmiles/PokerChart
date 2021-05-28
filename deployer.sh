#Ionic build for PWA deploy
ionic build --prod --release

python headWriter.py #separate script, writes to html to fix head and icon

firebase deploy