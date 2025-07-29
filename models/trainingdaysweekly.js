'use strict';
module.exports = (sequelize, DataTypes) => {
    const TrainingDaysWeekly = sequelize.define('TrainingDaysWeekly', {
        email: DataTypes.STRING,
        week_day: DataTypes.STRING,
        attended: DataTypes.BOOLEAN,
        to_show: DataTypes.BOOLEAN
    }, {
        tableName: 'training_days_weekly',
        underscored: true,
        timestamps: false
    });

    TrainingDaysWeekly.associate = function(models) {
        TrainingDaysWeekly.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return TrainingDaysWeekly;
};
