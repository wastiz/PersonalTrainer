'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('body_data', {
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
      height: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      waist: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      chest: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      shoulders: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      biceps: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      forearms: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      neck: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      hips: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      calves: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      measurement_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('body_data');
  }
};
