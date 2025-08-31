#!/bin/bash

# MongoDB Local Manager Script

case "$1" in
    start)
        echo "🚀 Starting MongoDB locally..."
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB is already running"
        else
            mkdir -p ~/data/db ~/data/logs
            mongod --dbpath ~/data/db --fork --logpath ~/data/logs/mongod.log
            echo "✅ MongoDB started successfully"
        fi
        ;;
    stop)
        echo "🛑 Stopping MongoDB..."
        pkill mongod
        echo "✅ MongoDB stopped"
        ;;
    status)
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB is running"
            ps aux | grep mongod | grep -v grep
        else
            echo "❌ MongoDB is not running"
        fi
        ;;
    restart)
        echo "🔄 Restarting MongoDB..."
        pkill mongod
        sleep 2
        mkdir -p ~/data/db ~/data/logs
        mongod --dbpath ~/data/db --fork --logpath ~/data/logs/mongod.log
        echo "✅ MongoDB restarted"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start MongoDB locally"
        echo "  stop    - Stop MongoDB"
        echo "  status  - Check if MongoDB is running"
        echo "  restart - Restart MongoDB"
        exit 1
        ;;
esac
