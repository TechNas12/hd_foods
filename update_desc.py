import sqlite3

db = sqlite3.connect('hd_foods.db')
cursor = db.cursor()

markdown_desc = """A customer writes, **"I love the speed of this laptop, but the battery life isn't great. It doesn't last through a full workday."**

Which features of *NLU* can help understand this feedback?

Select the two that apply."""

cursor.execute("UPDATE products SET description = ? WHERE id = 1", (markdown_desc,))
db.commit()
db.close()
print("Product 1 description updated with markdown.")
