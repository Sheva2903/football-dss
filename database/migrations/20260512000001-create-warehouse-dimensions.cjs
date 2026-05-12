'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'dim_date' },
      {
        date_id: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          primaryKey: true,
        },
        year: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        month: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        day: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        week: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        quarter: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        day_of_week: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }
    );

    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'dim_competitions' },
      {
        competition_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        country: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }
    );

    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'dim_clubs' },
      {
        club_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        club_name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        country: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }
    );

    await queryInterface.createTable(
      { schema: 'warehouse', tableName: 'dim_players' },
      {
        player_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        birth_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        position: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        nationality: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'dim_players' });
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'dim_clubs' });
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'dim_competitions' });
    await queryInterface.dropTable({ schema: 'warehouse', tableName: 'dim_date' });
  },
};
