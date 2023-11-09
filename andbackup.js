const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --source [string] --longTermInterval [cron pattern] --longTermMax [num]')
    .options({
        'source': { type: 'string', demandOption: true, describe: 'Source folder to backup' },
        'shortTermInterval': { type: 'string', describe: 'Short-term backup interval in cron pattern (optional)' },
        'longTermInterval': { type: 'string', demandOption: true, describe: 'Long-term backup interval in cron pattern' },
        'shortTermMax': { type: 'number', describe: 'Maximum number of short-term backups to keep (optional)' },
        'longTermMax': { type: 'number', demandOption: true, describe: 'Maximum number of long-term backups to keep' }
    })
    .help('h')
    .alias('h', 'help')
    .argv;

// Construct the backup and lock file paths
const backupRoot = `${argv.source}_backups`;
const recentBackupRoot = `${argv.source}_recent_backups`;
const lockFilePath = path.join(backupRoot, 'backup.lock');

// Initialize the application
async function init() {
    try {
        // Ensure the backup directories exist
        await fs.ensureDir(backupRoot);
        await fs.ensureDir(recentBackupRoot);

        // Try to acquire a lock
        const lockAcquired = await acquireLock();
        if (!lockAcquired) {
            throw new Error('Lock file exists. Another instance may be running.');
        }

        // Schedule short-term backups if interval is provided
        if (argv.shortTermInterval && argv.shortTermMax) {
            cron.schedule(argv.shortTermInterval, () => {
                backup(argv.source, recentBackupRoot, argv.shortTermMax, true);
            });
        }

        // Schedule long-term backups
        cron.schedule(argv.longTermInterval, () => {
            backup(argv.source, backupRoot, argv.longTermMax, false);
        });

        console.log('Backup service started.');
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
}

async function acquireLock() {
    try {
        await fs.writeFile(lockFilePath, '');
        return true;
    } catch (error) {
        if (error.code === 'EEXIST') {
            console.error('Lock file already exists, indicating another instance is running.');
        } else {
            console.error(`An error occurred while trying to acquire lock: ${error}`);
        }
        return false;
    }
}

async function releaseLock() {
    try {
        await fs.remove(lockFilePath);
    } catch (error) {
        console.error('Failed to release lock:', error);
    }
}

async function backup(source, destination, maxBackups, isShortTerm) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(destination, `backup-${timestamp}`);

    try {
        await fs.copy(source, backupDir);
        console.log(`Backup created at ${backupDir}`);

        // Cleanup old backups
        const backups = (await fs.readdir(destination))
            .filter(name => name.startsWith('backup-'))
            .sort()
            .reverse();

        const excessBackups = backups.slice(maxBackups);
        for (const backupName of excessBackups) {
            await fs.remove(path.join(destination, backupName));
        }
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

// Handle process exit
process.on('SIGINT', async () => {
    console.log('Backup service is stopping.');
    await releaseLock();
    process.exit();
});

// Start the application
init();
