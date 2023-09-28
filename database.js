const sql = require('mssql')

const sqlConfig = {
    user: 'sa',
    password: 'B1Admin',
    database: 'HJ1Warehouse',
    server: "10.20.14.87",
    pool: {
      max: 20,
      min: 5,
      idleTimeoutMillis: 60000  
    },
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  }
  
  try {
    const mssqlconnection = sql.connect(sqlConfig);
    global.mssqlconnection = {connection:mssqlconnection,sql};
    console.log('MSSQL Connection Success!')
  } catch (error) {
    console.error('MSSQL Connection Failed')
  }
// const { Sequelize, DataTypes } = require('sequelize');
// const mssqlconnection = new Sequelize('HJ1Warehouse', 'sa', 'B1Admin', {
//     host: '13.54.42.213',
//     //host: '10.20.14.87',//manual
//     dialect: 'mssql'
// });
//  let exist = await wmsdb.query(`SELECT PACKSLIP FROM shipmstr_all where CUST_ORDER = '` + x.buyerOrderId + "'")