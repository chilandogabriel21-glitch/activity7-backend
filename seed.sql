-- Inserts eight made-up records, only when the table is empty.
INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Wi-Fi drops in Lab 2', 'Network', 'The Wi-Fi in Computer Lab 2 disconnects every few minutes.', 'Pending'),
  ('Cannot install Python', 'Software', 'The installer for Python stops with an error on lab PC 7.', 'In progress'),
  ('Keyboard keys not working', 'Hardware', 'Several keys on the keyboard at station 12 do not respond.', 'Pending'),
  ('Forgotten student portal password', 'Account access', 'A student cannot log in to the portal after a password reset.', 'Completed'),
  ('Printer shows offline', 'Printing', 'The printer in the library shows offline from all computers.', 'In progress'),
  ('Projector has no signal', 'Hardware', 'The projector in Lecture Hall 1 shows no signal from the laptop.', 'Pending'),
  ('Antivirus update fails', 'Software', 'The antivirus on the staff office PC cannot download updates.', 'Completed'),
  ('No internet in Room A03', 'Network', 'The network socket in Room A03 has no internet connection.', 'Pending')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);
