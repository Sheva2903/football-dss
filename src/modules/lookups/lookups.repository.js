import { QueryTypes } from "sequelize";
import sequelize from "../../db/sequelize.js";

export async function listClubs() {
  return sequelize.query(
    `
      SELECT
        club_id AS "clubId",
        club_name AS "clubName",
        country
      FROM warehouse.dim_clubs
      WHERE club_name IS NOT NULL
      ORDER BY club_name ASC, club_id ASC
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

export async function listPositions() {
  return sequelize.query(
    `
      SELECT DISTINCT
        position AS value,
        position AS label
      FROM mart.player_ranking
      WHERE position IS NOT NULL
      ORDER BY position ASC
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}
