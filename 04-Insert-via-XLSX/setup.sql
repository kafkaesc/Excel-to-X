CREATE TABLE IF NOT EXISTS Songs(Title text, Artist text, Album text, [Year] int);
DELETE FROM Songs;
INSERT INTO Songs (Title, Artist, Album, [Year]) VALUES('Genesis', 'Grimes', 'Visions', 2012);
INSERT INTO Songs (Title, Artist, Album, [Year]) VALUES('Genesis', 'Justice', 'Justice', 2007);
SELECT * FROM Songs;
