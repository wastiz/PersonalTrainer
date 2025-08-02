'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('training_days_weekly', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'users',
          key: 'email',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      week_day: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      attended: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      to_show: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('training_days_weekly');
  }
};
