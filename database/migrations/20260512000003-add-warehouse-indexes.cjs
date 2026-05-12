'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'dim_players' },
      ['position'],
      { name: 'warehouse_dim_players_position_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'dim_clubs' },
      ['country'],
      { name: 'warehouse_dim_clubs_country_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      ['competition_id', 'season', 'date_id'],
      { name: 'warehouse_fact_matches_competition_season_date_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      ['home_club_id'],
      { name: 'warehouse_fact_matches_home_club_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      ['away_club_id'],
      { name: 'warehouse_fact_matches_away_club_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_player_performance' },
      ['match_id'],
      { name: 'warehouse_fact_player_performance_match_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_player_performance' },
      ['date_id'],
      { name: 'warehouse_fact_player_performance_date_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_player_valuations' },
      ['club_id'],
      { name: 'warehouse_fact_player_valuations_club_idx' }
    );

    await queryInterface.addIndex(
      { schema: 'warehouse', tableName: 'fact_player_valuations' },
      ['date_id'],
      { name: 'warehouse_fact_player_valuations_date_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_player_valuations' },
      'warehouse_fact_player_valuations_date_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_player_valuations' },
      'warehouse_fact_player_valuations_club_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_player_performance' },
      'warehouse_fact_player_performance_date_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_player_performance' },
      'warehouse_fact_player_performance_match_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      'warehouse_fact_matches_away_club_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      'warehouse_fact_matches_home_club_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'fact_matches' },
      'warehouse_fact_matches_competition_season_date_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'dim_clubs' },
      'warehouse_dim_clubs_country_idx'
    );

    await queryInterface.removeIndex(
      { schema: 'warehouse', tableName: 'dim_players' },
      'warehouse_dim_players_position_idx'
    );
  },
};
