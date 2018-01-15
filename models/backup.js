var mongoBackup = require('mongo-backup-to-s3');
 
var config = {
    mongodb:{
        url: "mongodb://localhost:27017/hurleyisms"
    },
    s3:{
        bucket:'hurleyismsprodbackup',
        folder:'backups',
        key: "AKIAI63G7L7QCUJUDYKQ",
        secret: "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"
    }
};
 
mongoBackup.dumpToS3(config);