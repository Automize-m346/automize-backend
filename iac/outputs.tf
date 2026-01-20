output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "mysql_fqdn" {
  value = azurerm_mysql_flexible_server.mysql.fqdn
}
