module.exports.datastores = {

    mysql_nc_document_app: {
      adapter: 'sails-mysql',
      url:'mysql://rootuser123:super2019@ncbiztestenv.chaqiqb07wh0.ap-southeast-1.rds.amazonaws.com:3306/nc_account_book',
    },
    mysql_namastecredit: {
      adapter: 'sails-mysql',
      url: 'mysql://nodejs:nodejs2024@marquemagic1.cluster-c3a68k68cq2b.ap-south-1.rds.amazonaws.com/namastecredit' 
      // url:'mysql://webappuser:Bangalore2018@@namastecredit-dev-env-write.chaqiqb07wh0.ap-southeast-1.rds.amazonaws.com:3306/namastecredit' 
  
    }
  };