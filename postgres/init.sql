CREATE TABLE IF NOT EXISTS "clientes" (
  "id" SERIAL PRIMARY KEY,
  "limite" bigint,
  "saldo" bigint
);

CREATE TABLE IF NOT EXISTS "transacoes" (
  "id" SERIAL PRIMARY KEY,
  "valor" bigint,
  "tipo" varchar,
  "descricao" varchar,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "client_id" integer
);

ALTER TABLE
  "transacoes"
ADD
  FOREIGN KEY ("client_id") REFERENCES "clientes" ("id");

INSERT INTO
  "clientes" (id, limite, saldo)
VALUES
  (1, 100000, 0),
  (2, 80000, 0),
  (3, 1000000, 0),
  (4, 10000000, 0),
  (5, 500000, 0);