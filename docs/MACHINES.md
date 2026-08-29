# Machines Registry

## Machine Matrix

| Machine | What | Cost | T-rating | Best Task | Trigger | Verified Date |
|---------|------|------|----------|-----------|---------|---------------|
| GitHub Actions | CI/CD automation | Free tier | T1 | Automated builds, testing, deployments | New PR/commit to main | VERIFIED |
| Local Terminal | Manual development | $0 | T1 | Direct code changes, debugging | Developer initiated | VERIFIED |
| Vercel | Frontend hosting | Free tier | T1 | Static site deployment | Git push to main | VERIFIED |
| Replit | Online IDE/prototyping | Free tier | T2 | Rapid prototyping, collaborative coding | Project setup, quick fixes | UNVERIFIED |
| Railway | Backend hosting | Free tier | T2 | API deployment, database hosting | Service deployment | UNVERIFIED |
| AWS EC2 | Cloud compute | Pay-per-use | T3 | Scalable infrastructure, production workloads | High-demand applications | UNVERIFIED |
| Google Cloud Platform | Cloud services | Pay-per-use | T3 | Advanced cloud services, ML/AI workloads | Complex cloud solutions | UNVERIFIED |
| Docker | Containerization | Free | T2 | Consistent environments, microservices | DevOps, deployment standardization | UNVERIFIED |
| Kubernetes | Container orchestration | Variable | T4 | Large-scale deployments, auto-scaling | Enterprise-level applications | UNVERIFIED |

## Adoption Rule

Machines follow a progressive adoption policy:
1. Start with free-tier trials when available
2. Default to manual verification before automation
3. Adopt on trigger events (specific project needs or scaling requirements)
4. Verify and document performance metrics before full integration

## Machine Policy (IDEA-063)

Default-Manual Machine Policy: All new machines should start with manual verification before being integrated into automated workflows. Prioritize free-tier trials for cost-effective evaluation and gradual adoption based on triggers such as performance requirements, scaling needs, or feature gaps in existing machines.