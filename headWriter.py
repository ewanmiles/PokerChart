file = open('./www/index.html', 'r')
data = file.read()

data = data.replace('favicon','pokericon')
data = data.replace('Ionic App','PokerChart')

file.close()

rewrite = open('./www/index.html', 'w')
rewrite.write(data)

rewrite.close()

print("Head rewritten to 'PokerChart'...")
print("Logo switched to 'pokericon.png'...")