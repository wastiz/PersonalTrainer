'use strict';
module.exports = (sequelize, DataTypes) => {
    const TotalTraining = sequelize.define('TotalTraining', {
        email: { type: DataTypes.STRING, unique: true },
        sessions: DataTypes.DECIMAL(4, 2),
        hours: DataTypes.DECIMAL(4, 2)
    }, {
        tableName: 'total_trainings',
        underscored: true,
        timestamps: false
    });

    TotalTraining.associate = function(models) {
        TotalTraining.belongsTo(models.User, { foreignKey: 'email', targetKey: 'email' });
    };

    return TotalTraining;
};
