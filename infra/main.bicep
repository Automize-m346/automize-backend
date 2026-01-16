// Bicep template for Azure Web App and PostgreSQL Flexible Server in Switzerland North
param webAppName string = 'automize-backend-app'
param dbServerName string = 'automizebackenddbserver'
param dbAdminUsername string = 'dbadmin'
param dbAdminPassword string
param location string = 'switzerlandnorth'
param dbName string = 'automizebackenddb'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${webAppName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'app'
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  serverFarmId: appServicePlan.id
  siteConfig: {
    appSettings: [
      {
        name: 'DATABASE_URL'
        value: 'postgres://${dbAdminUsername}:${dbAdminPassword}@${dbServerName}.postgres.database.azure.com:5432/${dbName}?sslmode=require'
      }
    ]
  }
}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: dbServerName
  location: location
  properties: {
    administratorLogin: dbAdminUsername
    administratorLoginPassword: dbAdminPassword
    version: '14'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
  }
  sku: {
    name: 'B_Standard_B1ms'
    tier: 'Burstable'
    family: 'B'
    capacity: 1
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  name: '${dbServerName}/${dbName}'
  properties: {}
}

resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  name: '${dbServerName}/AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}
