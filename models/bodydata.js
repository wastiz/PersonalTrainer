'use strict';
module.exports = (sequelize, DataTypes) => {
    const BodyData = sequelize.define('BodyData', {
        email: DataTypes.STRING,
        height: DataTypes.DECIMAL(5, 2),
        weight: DataTypes.DECIMAL(5, 2),
        waist: DataTypes.DECIMAL(5, 2),
        chest: DataTypes.DECIMAL(5, 2),
        shoulders: DataTypes.DECIMAL(5, 2),
        biceps: DataTypes.DECIMAL(5, 2),
        forearms: DataTypes.DECIMAL(5, 2),
        neck: DataTypes.DECIMAL(5, 2),
        hips: DataTypes.DECIMAL(5, 2),
        calves: DataTypes.DECIMAL(5, 2)
    }, {
        tableName: 'body_data',
        underscored: true,
        timestamps: true,
        createdAt: 'measurement_date',
        updatedAt: false
    });

    BodyData.associate = function(models) {
        BodyData.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return BodyData;
};
