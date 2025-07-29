'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        password: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, unique: true },
        is_assigned: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    User.associate = function(models) {
        User.hasOne(models.TotalTraining, { foreignKey: 'email', sourceKey: 'email' });
        User.hasMany(models.BodyData, { foreignKey: 'email', sourceKey: 'email' });
        User.hasMany(models.StrengthData, { foreignKey: 'email', sourceKey: 'email' });
        User.hasMany(models.TrainingPlan, { foreignKey: 'email', sourceKey: 'email' });
        User.hasMany(models.TrainingDaysWeekly, { foreignKey: 'email', sourceKey: 'email' });
        User.hasOne(models.UserStreak, { foreignKey: 'email', sourceKey: 'email' });
        User.hasOne(models.CaloriePlan, { foreignKey: 'email', sourceKey: 'email' });
        User.hasMany(models.CalorieEntry, { foreignKey: 'email', sourceKey: 'email' });
        User.hasOne(models.UserCalculation, { foreignKey: 'email', sourceKey: 'email' });
    };

    return User;
};
