'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_calculations', {
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'email'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      calorie_needs: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: true
      },
      bmi: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: true
      },
      bmi_category: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_calculations');
  }
};
