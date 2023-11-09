
# AndBackup

AndBackup is a Node.js-based backup utility that automates the process of backing up a specified source directory to a designated backup location. It supports both short-term (frequent) and long-term (less frequent) backup intervals.

## Features

- **Short-Term Backups**: Schedule backups to occur at short intervals (e.g., every second) and retain a specified number of recent backups.
- **Long-Term Backups**: Schedule less frequent backups (e.g., every hour) for long-term retention.
- **Cron Pattern Scheduling**: Use cron patterns to specify backup intervals for flexibility and precision.
- **Lock File Mechanism**: Prevents concurrent execution of backup processes for the same source directory.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the source code to your local machine.

    ```sh
    git clone https://github.com/your-username/AndBackup.git
    cd AndBackup
    ```

2. Install the required npm packages.

    ```sh
    npm install
    ```

## Usage

To start the backup process, run the `andbackup.js` script with the required parameters:

```sh
node andbackup.js --source "path/to/source" --longTermInterval "cron pattern" --longTermMax number_of_backups
```

### Parameters

- `--source`: The source directory you wish to back up.
- `--longTermInterval`: The cron pattern to define the long-term backup interval.
- `--longTermMax`: The maximum number of long-term backups to retain.
- `--shortTermInterval` (optional): The cron pattern to define the short-term backup interval.
- `--shortTermMax` (optional): The maximum number of short-term backups to retain.

### Examples

- To perform a long-term backup every hour, keeping a maximum of 24 backups:

    ```sh
    node andbackup.js --source "path/to/source" --longTermInterval "0 * * * *" --longTermMax 24
    ```

- To perform a short-term backup every 15 seconds, keeping the last 4 backups, and a long-term backup every day at midnight, keeping the last 7 backups:

    ```sh
    node andbackup.js --source "path/to/source" --shortTermInterval "*/15 * * * * *" --shortTermMax 4 --longTermInterval "0 0 * * *" --longTermMax 7
    ```

## Cron Pattern

The cron pattern is a string comprising five or six fields separated by white space that represents a set of times.

```
*    *    *    *    *    *
|    |    |    |    |    |
|    |    |    |    |    +-- Year (optional)
|    |    |    |    +------ Day of the Week (0 - 7) (Sunday to Sunday, 7 is also Sunday)
|    |    |    +--------- Month (1 - 12)
|    |    +------------ Day of the Month (1 - 31)
|    +--------------- Hour (0 - 23)
+------------------ Minute (0 - 59)
```

## Lock File

A lock file (`backup.lock`) is created in the long-term backup directory to prevent multiple instances of the backup process from running simultaneously. If the lock file exists when the program starts, it indicates that another instance is running, and the program will exit.

## Stopping the Backup Service

To stop the backup service, send a `SIGINT` signal by pressing `Ctrl+C` in the terminal where the service is running.

## Contributing

Contributions to AndBackup are welcome! Please read our contributing guidelines before submitting pull requests.

## License

AndBackup is released under the [MIT License](LICENSE).
