module.exports = {
    name: 'freefood',
    description: 'Lists all free food events on OU campus',
    feature: 'freefood',
    async execute(message, args, client) {
        //Can either be an image URL or a text description as a fallback
        let eventLinks = await this.fetchEngage()

        if (eventLinks.length === 0) {
            return message.reply('Could not find any free food :cry:')
        }

        let reply = 'Found free food!\n'

        for (const link of eventLinks) {
            reply += link + '\n'
        }

        message.reply(reply)
    },

    async fetchEngage() {
        let json
        let eventLinks = []
        try {
            const response = await fetch('https://ou.campuslabs.com/engage/api/discovery/event/search')
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            let json = await response.json()

            for (const event of json.value) {
                if (event.benefitNames.includes('Free Food') || this.stringContainsFood(event.description)) {
                    eventLinks.push('https://ou.campuslabs.com/engage/event/' + event.id)
                }
            }

        } catch (error) {
            console.error(error.message)
        }
        
        return eventLinks
        
    },

    stringContainsFood(str) {
        keywords = ["food", "snack", "pizza"]
        for (const keyword of keywords) {
            if (str.includes(keyword)) return true
        }
        return false
    }
};