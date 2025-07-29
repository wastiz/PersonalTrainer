'use strict';
module.exports = (sequelize, DataTypes) => {
    const CalorieEntry = sequelize.define('CalorieEntry', {
        email: DataTypes.STRING,
        calories: DataTypes.INTEGER,
        entry_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'calorie_entries',
        underscored: true,
        timestamps: false
    });

    CalorieEntry.associate = function(models) {
        CalorieEntry.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return CalorieEntry;
};
