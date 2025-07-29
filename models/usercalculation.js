'use strict';
module.exports = (sequelize, DataTypes) => {
    const UserCalculation = sequelize.define('UserCalculation', {
        email: { type: DataTypes.STRING, primaryKey: true },
        calorie_needs: DataTypes.DECIMAL(7, 2),
        bmi: DataTypes.DECIMAL(7, 2),
        bmi_category: DataTypes.STRING
    }, {
        tableName: 'user_calculations',
        underscored: true,
        timestamps: false
    });

    UserCalculation.associate = function(models) {
        UserCalculation.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return UserCalculation;
};
