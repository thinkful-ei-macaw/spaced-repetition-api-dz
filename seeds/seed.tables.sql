BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Esperanto', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'Mi', 'I', 2),
  (2, 1, 'Vi', 'You', 3),
  (3, 1, 'Viro', 'Man', 4),
  (4, 1, 'Virino', 'Woman', 5),
  (5, 1, 'Estas', 'Is', 6),
  (6, 1, 'Kaj', 'And', 7),
  (7, 1, 'Ne', 'No', 8),
  (8, 1, 'Saluton', 'Hello', 9),
  (9, 1, 'Bonvenon', 'Welcome', 10),
  (10, 1, 'Gis la revido!', 'Goodbye', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
