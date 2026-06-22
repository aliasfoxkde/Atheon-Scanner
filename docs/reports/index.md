# Atheon Scanner - Report Database

**Last Updated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Total Reports:** $(find "$REPORTS_DIR" -name "*.md" -type f | wc -l)

## About This Database

This database contains comprehensive security and quality analysis reports for popular GitHub repositories across multiple categories. Each report includes:

- **Quality Score**: 0-100 score with tier assignment (A-F)
- **Security Analysis**: Critical, high, medium, and low severity findings
- **Code Quality Metrics**: Test coverage, documentation, complexity analysis
- **Detailed Findings**: Specific issues with file locations and recommendations

## Categories

### web-frameworks

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|
| [angular/angular](../reports/web-frameworks/angular_angular.md) | 100393 | 68 | N/A | 1044 | 0 | 24 | [View](../reports/web-frameworks/angular_angular.md) |
| [gatsbyjs/gatsby](../reports/web-frameworks/gatsbyjs_gatsby.md) | 55940 | 98 | N/A | 870 | 0 | 0 | [View](../reports/web-frameworks/gatsbyjs_gatsby.md) |
| [nuxt/nuxt](../reports/web-frameworks/nuxt_nuxt.md) | 60493 | 100 | N/A | 193 | 0 | 0 | [View](../reports/web-frameworks/nuxt_nuxt.md) |
| [remix-run/remix](../reports/web-frameworks/remix-run_remix.md) | 33088 | 89 | N/A | 521 | 0 | 37 | [View](../reports/web-frameworks/remix-run_remix.md) |
| [sveltejs/svelte](../reports/web-frameworks/sveltejs_svelte.md) | 87343 | 100 | N/A | 147 | 0 | 0 | [View](../reports/web-frameworks/sveltejs_svelte.md) |
| [vercel/next.js](../reports/web-frameworks/vercel_next.js.md) | 140117 | 68 | N/A | 1849 | 0 | 8 | [View](../reports/web-frameworks/vercel_next.js.md) |
| [vuejs/vue](../reports/web-frameworks/vuejs_vue.md) | 209931 | 100 | N/A | 45 | 0 | 1 | [View](../reports/web-frameworks/vuejs_vue.md) |


### cli-tools

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|
| [cli/cli](../reports/cli-tools/cli_cli.md) | 44905 | 86 | N/A | 81 | 0 | 14 | [View](../reports/cli-tools/cli_cli.md) |
| [docker-archive/docker-ce](../reports/cli-tools/docker-archive_docker-ce.md) | 5758 | 76 | N/A | 266 | 0 | 44 | [View](../reports/cli-tools/docker-archive_docker-ce.md) |
| [git/git](../reports/cli-tools/git_git.md) | 61568 | 100 | N/A | 199 | 0 | 0 | [View](../reports/cli-tools/git_git.md) |
| [golang/go](../reports/cli-tools/golang_go.md) | 134850 | 77 | N/A | 943 | 0 | 12 | [View](../reports/cli-tools/golang_go.md) |
| [kubernetes/kubernetes](../reports/cli-tools/kubernetes_kubernetes.md) | 123130 | 78 | N/A | 1257 | 0 | 203 | [View](../reports/cli-tools/kubernetes_kubernetes.md) |
| [neovim/neovim](../reports/cli-tools/neovim_neovim.md) | 100551 | 100 | N/A | 11 | 0 | 0 | [View](../reports/cli-tools/neovim_neovim.md) |
| [nodejs/node](../reports/cli-tools/nodejs_node.md) | 117868 | 68 | N/A | 970 | 0 | 77 | [View](../reports/cli-tools/nodejs_node.md) |
| [python/cpython](../reports/cli-tools/python_cpython.md) | 73323 | 70 | N/A | 4545 | 0 | 22 | [View](../reports/cli-tools/python_cpython.md) |
| [rust-lang/rust](../reports/cli-tools/rust-lang_rust.md) | 113990 | 97 | N/A | 139 | 0 | 0 | [View](../reports/cli-tools/rust-lang_rust.md) |
| [vim/vim](../reports/cli-tools/vim_vim.md) | 40535 | 98 | N/A | 250 | 0 | 0 | [View](../reports/cli-tools/vim_vim.md) |


### ml-ai

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|
| [huggingface/transformers](../reports/ml-ai/huggingface_transformers.md) | 161723 | 100 | N/A | 2862 | 0 | 0 | [View](../reports/ml-ai/huggingface_transformers.md) |
| [keras-team/keras](../reports/ml-ai/keras-team_keras.md) | 64094 | 100 | N/A | 438 | 0 | 0 | [View](../reports/ml-ai/keras-team_keras.md) |
| [langchain-ai/langchain](../reports/ml-ai/langchain-ai_langchain.md) | 139695 | 69 | N/A | 577 | 0 | 9 | [View](../reports/ml-ai/langchain-ai_langchain.md) |
| [microsoft/semantic-kernel](../reports/ml-ai/microsoft_semantic-kernel.md) | 28163 | 86 | N/A | 1538 | 0 | 30 | [View](../reports/ml-ai/microsoft_semantic-kernel.md) |
| [openai/gym](../reports/ml-ai/openai_gym.md) | 37225 | 100 | N/A | 26 | 0 | 0 | [View](../reports/ml-ai/openai_gym.md) |
| [pytorch/pytorch](../reports/ml-ai/pytorch_pytorch.md) | 100878 | 99 | N/A | 7502 | 0 | 0 | [View](../reports/ml-ai/pytorch_pytorch.md) |
| [scikit-learn/scikit-learn](../reports/ml-ai/scikit-learn_scikit-learn.md) | 66371 | 99 | N/A | 1764 | 0 | 0 | [View](../reports/ml-ai/scikit-learn_scikit-learn.md) |
| [tensorflow/tensorflow](../reports/ml-ai/tensorflow_tensorflow.md) | 195775 | 98 | N/A | 1403 | 0 | 0 | [View](../reports/ml-ai/tensorflow_tensorflow.md) |


### databases

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|
| [apache/cassandra](../reports/databases/apache_cassandra.md) | 9783 | 68 | N/A | 672 | 0 | 109 | [View](../reports/databases/apache_cassandra.md) |
| [cockroachdb/cockroach](../reports/databases/cockroachdb_cockroach.md) | 32213 | 73 | N/A | 428 | 0 | 189 | [View](../reports/databases/cockroachdb_cockroach.md) |
| [elastic/elasticsearch](../reports/databases/elastic_elasticsearch.md) | 77077 | 74 | N/A | 310 | 0 | 49 | [View](../reports/databases/elastic_elasticsearch.md) |
| [mongodb/mongo](../reports/databases/mongodb_mongo.md) | 28377 | 68 | N/A | 2409 | 0 | 823 | [View](../reports/databases/mongodb_mongo.md) |
| [postgres/postgres](../reports/databases/postgres_postgres.md) | 21196 | 76 | N/A | 62 | 0 | 3 | [View](../reports/databases/postgres_postgres.md) |
| [redis/redis](../reports/databases/redis_redis.md) | 74991 | 97 | N/A | 245 | 0 | 0 | [View](../reports/databases/redis_redis.md) |


### testing

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|
| [apache/jmeter](../reports/testing/apache_jmeter.md) | 9433 | 77 | N/A | 122 | 0 | 5 | [View](../reports/testing/apache_jmeter.md) |
| [appium/appium](../reports/testing/appium_appium.md) | 21661 | 88 | N/A | 51 | 0 | 2 | [View](../reports/testing/appium_appium.md) |
| [google/googletest](../reports/testing/google_googletest.md) | 38725 | 100 | N/A | 10 | 0 | 0 | [View](../reports/testing/google_googletest.md) |
| [jestjs/jest](../reports/testing/jestjs_jest.md) | 45459 | 92 | N/A | 250 | 0 | 1 | [View](../reports/testing/jestjs_jest.md) |
| [pytest-dev/pytest](../reports/testing/pytest-dev_pytest.md) | 14224 | 100 | N/A | 351 | 0 | 1 | [View](../reports/testing/pytest-dev_pytest.md) |
| [testing-library/react-testing-library](../reports/testing/testing-library_react-testing-library.md) | 19604 | 100 | N/A | 6 | 0 | 0 | [View](../reports/testing/testing-library_react-testing-library.md) |


### other

| Repository | Stars | Quality | Tier | Findings | Critical | High | Report |
|-----------|-------|---------|------|----------|----------|------|--------|



## Overall Statistics

### Quality Distribution
- **Tier A (90-100)**: Excellent quality repositories
- **Tier B (75-89)**: Good quality with minor issues
- **Tier C (60-74)**: Acceptable quality with moderate issues
- **Tier D (40-59)**: Below average quality
- **Tier F (0-39)**: Poor quality requiring significant improvement

### Finding Categories
- **Security**: Vulnerabilities, secrets, credentials, API keys
- **Code Quality**: Technical debt, code smells, anti-patterns
- **Maintenance**: TODOs, FIXMEs, known issues
- **Best Practices**: Language-specific pattern adherence

### Methodology

Each repository is scanned using the Atheon pattern matching engine with comprehensive security and quality analysis:

1. **Repository Discovery**: Popular repositories by category and star count
2. **Code Analysis**: Pattern matching for security vulnerabilities and code quality issues
3. **Quality Metrics**: Test coverage, documentation, complexity assessment
4. **Scoring**: Intelligent scoring algorithm with severity weighting
5. **Report Generation**: Comprehensive markdown reports with actionable recommendations

### About Atheon

This scanner uses patterns and concepts from the [Atheon](https://github.com/HoraDomu/Atheon) project by HoraDomu.

---

**Database Version**: 1.0.0
**Scanner Version**: 0.1.0-alpha
**Last Scan**: $(date -u +"%Y-%m-%d")

For the latest updates and to contribute, visit [Atheon-Scanner](https://github.com/aliasfoxkde/Atheon-Scanner).
