'use strict';
module.exports = (sequelize, DataTypes) => {
    const TrainingPlan = sequelize.define('TrainingPlan', {
        email: DataTypes.STRING,
        day_of_week: DataTypes.STRING,
        session_duration_hours: DataTypes.DECIMAL(4, 2)
    }, {
        tableName: 'training_plans',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    TrainingPlan.associate = function(models) {
        TrainingPlan.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return TrainingPlan;
};
