'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'fact_matches' },
      {
        match_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        competition_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_competitions' },
            key: 'competition_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        date_id: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_date' },
            key: 'date_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        season: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        home_club_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_clubs' },
            key: 'club_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        away_club_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_clubs' },
            key: 'club_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        home_score: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        away_score: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      }
    );

    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'fact_player_performance' },
      {
        player_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_players' },
            key: 'player_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        match_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
          references: {
            model: { schema: 'warehouse', tableName: 'fact_matches' },
            key: 'match_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        date_id: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_date' },
            key: 'date_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        minutes_played: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        goals: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        assists: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        yellow_cards: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        red_cards: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      }
    );

    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'fact_player_valuations' },
      {
        player_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_players' },
            key: 'player_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        date_id: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          primaryKey: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_date' },
            key: 'date_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        market_value_eur: {
          type: Sequelize.DECIMAL,
          allowNull: true,
        },
        club_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: { schema: 'warehouse', tableName: 'dim_clubs' },
            key: 'club_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'fact_player_valuations' });
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'fact_player_performance' });
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'fact_matches' });
  },
};
