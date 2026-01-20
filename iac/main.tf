terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
}

provider "azurerm" {
  features {}
}

# -----------------------------
# Resource Group
# -----------------------------
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# -----------------------------
# App Service Plan (Linux)
# -----------------------------
resource "azurerm_service_plan" "asp" {
  name                = var.app_service_plan_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# -----------------------------
# Linux Web App (Backend)
# -----------------------------
resource "azurerm_linux_web_app" "backend" {
  name                = var.web_app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack {
      docker_image     = var.docker_image
      docker_image_tag = "latest"
    }

    always_on = true
  }

  app_settings = {
    NODE_ENV      = "production"
    RUN_MIGRATIONS = "1"

    DB_HOST = azurerm_mysql_flexible_server.mysql.fqdn
    DB_PORT = "3306"
    DB_USER = var.db_admin_user
    DB_PASS = var.db_admin_password
    DB_NAME = var.db_name

    DB_REQUIRE_SSL              = "true"
    DB_SSL_REJECT_UNAUTHORIZED  = "false"

    DOCKER_REGISTRY_SERVER_URL      = "https://ghcr.io"
    DOCKER_REGISTRY_SERVER_USERNAME = var.ghcr_username
    DOCKER_REGISTRY_SERVER_PASSWORD = var.ghcr_token
  }
}

# -----------------------------
# MySQL Flexible Server
# -----------------------------
resource "azurerm_mysql_flexible_server" "mysql" {
  name                   = var.mysql_server_name
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location

  administrator_login    = var.db_admin_user
  administrator_password = var.db_admin_password

  version        = "8.0.21"
  sku_name       = "Standard_B1ms"
  storage_mb     = 32768
  backup_retention_days = 7

  public_network_access_enabled = true
}

# -----------------------------
# MySQL Database
# -----------------------------
resource "azurerm_mysql_flexible_database" "db" {
  name                = var.db_name
  server_name         = azurerm_mysql_flexible_server.mysql.name
  resource_group_name = azurerm_resource_group.rg.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}
