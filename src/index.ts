// import express, { type Express } from "express";
import Fastify from "fastify";
// import pgPromise from "pg-promise";
import { Client } from "pg";

const app = Fastify();
const port = 3000;

const client = new Client({
  connectionString: "postgres://postgres:p.postgres@127.0.0.1:5432/postgres_db",
});

// export const db = pgPromise()({
//   connectionString: "postgres://postgres:p.postgres@127.0.0.1:5432/postgres_db",
// });

app.get("/", (_, res) => {
  return "Health check";
});

app.post("/clientes/:id/transacoes", async (req, res) => {
  const body: { valor: number; tipo: string; descricao: string } = req.body as {
    valor: number;
    tipo: string;
    descricao: string;
  };
  const id = (req.params as { id: string }).id;
  try {
    const result = await client.query(
      "SELECT limite, saldo FROM clientes WHERE id = $1;",
      [id],
    );
    const account = result.rows[0];
    // const account = await client.one({
    //   text: "SELECT id, limite, saldo FROM clientes WHERE id = $1",
    //   values: [(req.params as { id: string }).id],
    // });
    await client.query(
      "INSERT INTO transacoes (client_id, valor, tipo, descricao) VALUES ($1, $2, $3, $4);",
      [
        (req.params as { id: string }).id,
        body.valor,
        body.tipo,
        body.descricao,
      ],
    );
    return {
      limite: account.limite,
      saldo: +account.saldo + body.valor,
    };
  } catch (err) {
    console.error(err);
  }
});

app.get("/clientes/:id/extrato", async (req, res) => {
  try {
    const [account, transactions] = await Promise.all([
      client.query({
        text: "SELECT limite, saldo FROM clientes WHERE id = $1",
        values: [(req.params as { id: string }).id],
      }),
      client.query(
        "SELECT valor, tipo, descricao, created_at FROM transacoes WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10;",
        [(req.params as { id: string }).id],
      ),
    ]);
    const user = account.rows[0];

    return {
      saldo: {
        total: +user.saldo,
        limite: +user.limite,
        data_extrato: new Date().toISOString(),
      },
      ultimas_transacoes: transactions.rows,
    };
  } catch (error) {
    console.error(error);
    return await res.code(404).send();
  }
});

app.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    return;
  }
  client.connect();
  console.log(`Listening on ${address}`);
});
