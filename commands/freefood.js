module.exports = {
    name: 'freefood',
    description: 'Lists all free food events on OU campus',
    feature: 'freefood',
    execute(message, args, client) {
        imageUrls = ''
        this.fetchEngage().then(result => {
            imageUrls += result
        })

        if (imageUrls != '') {
            return message.reply(imageUrls)
        }

        return message.reply('Could not find any free food :cry:')
    },

    async fetchEngage() {
        let json
        let imageUrls = ''
        try {
            const response = await fetch('https://ou.campuslabs.com/engage/api/discovery/event/search')
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            json = await response.json()
        } catch (error) {
            console.error(error.message)
            return ''
        }

        for (const event in json.value) {
            console.log(event)
            if (event.benefitNames.includes('Free Food') || stringContainsFood(event.description)) {
                imageUrls += 'https://se-images.campuslabs.com/clink/images/' + event.imagePath +'\n'
            }
        }
        return imageUrls
    },

    stringContainsFood(str) {
        keywords = ["food", "snack", "pizza"]

        for (const keyword of keywords) {
            if (str.includes(keyword)) return true
        }
        return false
    }
};