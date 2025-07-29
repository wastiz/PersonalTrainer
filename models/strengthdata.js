'use strict';
module.exports = (sequelize, DataTypes) => {
    const StrengthData = sequelize.define('StrengthData', {
        email: DataTypes.STRING,
        bench_press_wide: DataTypes.DECIMAL(5, 2),
        bench_press_narrow: DataTypes.DECIMAL(5, 2),
        bicep_curl: DataTypes.DECIMAL(5, 2),
        bent_over_one_arm_row: DataTypes.DECIMAL(5, 2),
        deadlift: DataTypes.DECIMAL(5, 2),
        squats: DataTypes.DECIMAL(5, 2)
    }, {
        tableName: 'strength_data',
        underscored: true,
        timestamps: true,
        createdAt: 'measurement_date',
        updatedAt: false
    });

    StrengthData.associate = function(models) {
        StrengthData.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return StrengthData;
};
