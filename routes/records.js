const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const MAX_ID = 2147483647; // largest value a PostgreSQL integer id can hold

// id must be a positive whole number. Returns the number, or null when invalid.
function parseId(value) {
  if (!/^[0-9]+$/.test(value)) return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1 || id > MAX_ID) return null;
  return id;
}

// Checks the four editable fields. Any id sent by the client is ignored.
// Returns { error } or { value }.
function validateRecord(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }

  const rules = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];
  const value = {};

  for (const [key, label, min, max] of rules) {
    if (typeof body[key] !== "string") {
      return { error: `${label} is required and must be text.` };
    }
    const text = body[key].trim();
    if (text.length < min || text.length > max) {
      return { error: `${label} must have ${min} to ${max} characters.` };
    }
    value[key] = text;
  }

  if (typeof body.status !== "string") {
    return { error: "Status is required and must be text." };
  }
  const status = body.status.trim();
  if (!STATUSES.includes(status)) {
    return { error: "Status must be Pending, In progress or Completed." };
  }
  value.status = status;

  return { value };
}

const INVALID_ID = { message: "Id must be a positive whole number." };
const NOT_FOUND = { message: "Record not found." };

// GET all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status " +
      "FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(INVALID_ID);

    const result = await pool.query(
      "SELECT id, title, category, description, status " +
      "FROM records WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json(NOT_FOUND);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create a record
router.post("/", async (req, res, next) => {
  try {
    const { error, value } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
      "VALUES ($1, $2, $3, $4) " +
      "RETURNING id, title, category, description, status",
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT replace the four editable fields of an existing record
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(INVALID_ID);

    const { error, value } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
      "WHERE id = $5 " +
      "RETURNING id, title, category, description, status",
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rowCount === 0) return res.status(404).json(NOT_FOUND);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE a record
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(INVALID_ID);

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json(NOT_FOUND);
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
