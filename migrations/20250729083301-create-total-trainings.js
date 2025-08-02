'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('total_trainings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        references: {
          model: 'users',
          key: 'email',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sessions: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      hours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('total_trainings');
  }
};
