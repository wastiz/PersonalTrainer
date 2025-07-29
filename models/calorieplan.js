'use strict';
module.exports = (sequelize, DataTypes) => {
    const CaloriePlan = sequelize.define('CaloriePlan', {
        email: { type: DataTypes.STRING, unique: true },
        daily_calorie_goal: DataTypes.INTEGER
    }, {
        tableName: 'calorie_plans',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    CaloriePlan.associate = function(models) {
        CaloriePlan.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return CaloriePlan;
};
