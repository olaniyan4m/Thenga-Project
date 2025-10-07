# Minimal Terraform blueprint example (provider config removed for brevity)
# Replace provider and credentials, then customize resources for your cloud.
variable "project" { default = "pezela" }

resource "random_id" "suffix" { byte_length = 4 }

# Example S3 (assets)
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project}-assets-${random_id.suffix.hex}"
  acl    = "private"
}

# Example RDS (Postgres) -- replace password with secret manager
resource "aws_db_instance" "postgres" {
  identifier = "${var.project}-db"
  engine = "postgres"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  name = "pezeladb"
  username = "pezela_admin"
  password = "replace_with_secret"
  skip_final_snapshot = true
}
