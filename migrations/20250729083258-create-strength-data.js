'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('strength_data', {
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
      bench_press_wide: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      bench_press_narrow: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      bicep_curl: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      bent_over_one_arm_row: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      deadlift: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      squats: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      measurement_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      // updatedAt нет, согласно модели
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('strength_data');
  }
};
