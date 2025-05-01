module.exports = {
  name: 'help',
  description: 'Displays all available commands and features',
  feature: 'core', // Core functionality
  execute(message, args, client) {
    // Create organized help message with commands grouped by feature
    const helpMessage = [];
    
    // Add stylish header with bot name
    helpMessage.push('# 🤖 BiggerBot Help Center');
    helpMessage.push('*Your friendly Discord assistant with multiple features*');
    helpMessage.push('');
    
    // Group commands by feature
    const commandsByFeature = {};
    
    // Initialize with core and general categories
    commandsByFeature['core'] = [];
    
    // Initialize feature categories from all available features
    client.features.forEach(feature => {
      commandsByFeature[feature.name] = [];
    });
    
    // Add 'general' category for commands without a specific feature
    commandsByFeature['general'] = [];
    
    // Sort commands into their feature categories
    client.commands.forEach(cmd => {
      const featureType = cmd.feature || 'general';
      if (!commandsByFeature[featureType]) {
        commandsByFeature[featureType] = [];
      }
      commandsByFeature[featureType].push(cmd);
    });
    
    // Feature icons for visual enhancement
    const featureIcons = {
      'core': '⚙️',
      'counting': '🔢',
      'dailyQuestion': '❓',
      'buzzwordResponse': '🔍',
      'general': '📋'
    };
    
    // Display commands by feature section
    helpMessage.push('## 📜 Commands');
    
    // First display core commands
    if (commandsByFeature['core'].length > 0) {
      helpMessage.push(`### ${featureIcons['core']} Core Commands`);
      commandsByFeature['core'].forEach(cmd => {
        helpMessage.push(`- \`!${cmd.name}\` - ${cmd.description}`);
      });
      helpMessage.push('');
    }
    
    // Then display feature-specific commands
    client.features.forEach(feature => {
      if (commandsByFeature[feature.name] && commandsByFeature[feature.name].length > 0) {
        const icon = featureIcons[feature.name] || '🔹';
        helpMessage.push(`### ${icon} ${feature.name} Commands`);
        commandsByFeature[feature.name].forEach(cmd => {
          helpMessage.push(`- \`!${cmd.name}\` - ${cmd.description}`);
        });
        helpMessage.push('');
      }
    });
    
    // Finally display general commands (if any)
    if (commandsByFeature['general'].length > 0) {
      helpMessage.push(`### ${featureIcons['general']} General Commands`);
      commandsByFeature['general'].forEach(cmd => {
        helpMessage.push(`- \`!${cmd.name}\` - ${cmd.description}`);
      });
      helpMessage.push('');
    }
    
    // List all automated features with better formatting
    helpMessage.push('## 🤖 Automated Features');
    helpMessage.push('*These features run automatically in the background*');
    helpMessage.push('');
    
    client.features.forEach(feature => {
      const icon = featureIcons[feature.name] || '🔹';
      helpMessage.push(`- **${icon} ${feature.name}**: ${feature.description}`);
    });
    
    // Add a footer with additional help info
    helpMessage.push('');
    helpMessage.push('---');
    helpMessage.push('*For more help with a specific command, use `!help [command name]`*');
    
    // Send the help message
    return message.reply(helpMessage.join('\n'));
  },
};