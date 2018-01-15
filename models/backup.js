var mongoBackup = require('mongo-backup-to-s3');
 
var config = {
    mongodb:{
        url: "mongodb://localhost:27017/hurleyisms"
    },
    s3:{
        bucket:'hurleyismsprodbackup',
        folder:'backups',
        key: "[Key]",
        secret: "[Secret]"
    }
};
 
mongoBackup.dumpToS3(config);