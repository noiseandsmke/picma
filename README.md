# PICMA - Property Insurance Management Application

## 1. Tổng quan dự án (Project Overview)

### Bối cảnh (The Context)

Trong thị trường bảo hiểm tài sản truyền thống, quy trình kết nối giữa **Chủ nhà (Property Owners)** và **Đại lý bảo
hiểm (Agents)** thường rời rạc và thủ công. Chủ nhà gặp khó khăn trong việc tìm kiếm đại lý uy tín tại địa phương, trong
khi đại lý lại tốn nhiều chi phí marketing để tiếp cận khách hàng tiềm năng.

### Giải pháp PICMA (The Solution)

**PICMA** (Property Insurance Management Application) là một nền tảng **Microservices** toàn diện được thiết kế để số
hóa và tự động hóa toàn bộ quy trình này.

* **Sứ mệnh:** Tạo ra một "sàn giao dịch" minh bạch, nơi nhu cầu bảo hiểm (Leads) được phân phối tự động đến đúng người,
  đúng thời điểm.
* **Giá trị cốt lõi:**
    * **Tốc độ:** Lead được đẩy về Agent ngay lập tức qua Kafka (Real-time).
    * **Chính xác:** Thuật toán matching dựa trên Zipcode đảm bảo Agent chỉ nhận khách hàng trong khu vực mình phụ
      trách.
    * **Minh bạch:** Toàn bộ quy trình Báo giá (Quoting) và Chốt đơn (Binding) được lưu vết rõ ràng.

### Đối tượng sử dụng (Target Audience)

1. **Property Owners:** Đăng ký tài sản, gửi yêu cầu bảo hiểm, so sánh báo giá.
2. **Insurance Agents:** Nhận Lead tiềm năng, gửi báo giá chi tiết, quản lý hợp đồng.
3. **Admins:** Quản trị người dùng, theo dõi hiệu suất hệ thống qua Dashboard trực quan.

Dự án áp dụng các tiêu chuẩn công nghiệp hiện đại: **Java Spring Boot 3** cho backend, **React 18** cho frontend, *
*Keycloak** cho bảo mật, và **Kafka** cho xử lý sự kiện bất đồng bộ.

---

## 2. Kiến trúc hệ thống (System Architecture)

Hệ thống được tổ chức thành 3 nhóm dịch vụ chính:

### A. Infrastructure Services (Hạ tầng)

Nơi chứa các dịch vụ nền tảng cốt lõi để vận hành, định tuyến và bảo mật cho toàn bộ hệ thống microservices.

1. **Registry Server (`registry-server`)** - Port `8761`
    * **Vai trò:** Service Discovery (Eureka Server) - "Trái tim" định danh của hệ thống.
    * **Công nghệ:** Spring Cloud Netflix Eureka Server.
    * **Tại sao cần service này?** Trong môi trường Microservices (đặc biệt khi chạy Docker), địa chỉ IP của các service
      là động (dynamic) và có thể thay đổi mỗi khi khởi động lại. Các service không thể "biết" địa chỉ IP của nhau
      trước. Registry Server giải quyết vấn đề này.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Self-Registration (Tự đăng ký):** Khi một service (ví dụ: `user-mgmt-service`) khởi động, nó gửi một yêu cầu
          REST đến `registry-server` chứa thông tin meta-data: IP, Port, Health Check URL, và Tên Service.
        * **Heartbeat (Nhịp tim):** Mặc định mỗi **30 giây**, các client sẽ gửi tín hiệu "renew" đến Registry để báo
          rằng "tôi vẫn đang hoạt động".
        * **Eviction (Loại bỏ):** Nếu Registry Server không nhận được heartbeat từ một service trong vòng **90 giây**,
          nó sẽ coi service đó đã "chết" và loại bỏ khỏi danh sách đăng ký. Điều này đảm bảo Gateway không bao giờ điều
          hướng người dùng vào một service đã sập.
        * **Client-Side Load Balancing:** Registry Server chia sẻ danh sách các active service cho Gateway và các
          service khác. Nhờ đó, các client có thể tự thuật toán chọn instance phù hợp (Round Robin) để gọi mà không cần
          load balancer phần cứng.
        * **Self-Preservation Mode (Chế độ tự bảo vệ):** Nếu mạng gặp sự cố khiến hàng loạt service không thể gửi
          heartbeat (dù chúng vẫn sống), Registry Server sẽ kích hoạt chế độ này để **ngừng loại bỏ** các instance khỏi
          danh sách, tránh việc xóa nhầm toàn bộ hệ thống.

2. **API Gateway (`iden-gateway`)** - Port `6060`
    * **Vai trò:** Cổng vào duy nhất (API Gateway & Security Entry Point) - "Người gác cổng" của hệ thống.
    * **Công nghệ:** Spring Cloud Gateway (WebFlux - Non-blocking I/O), Spring Security OAuth2 Resource Server.
    * **Tại sao cần service này?** Thay vì để Client (Frontend/Mobile) gọi trực tiếp hàng chục microservice, Gateway
      đóng vai trò là điểm truy cập duy nhất. Nó giúp ẩn giấu kiến trúc hệ thống bên trong và tập trung xử lý các vấn
      đề "cắt ngang" (cross-cutting concerns) như bảo mật, logging, và giám sát.
    * **Chức năng chuyên sâu:**
        * **Security & OAuth2 Integration:**
            * Hoạt động như một **OAuth2 Resource Server**. Nó chặn mọi request để kiểm tra `Bearer Token` (JWT) trước
              khi cho phép đi qua.
            * Tích hợp chặt chẽ với **Keycloak** để validate chữ ký số của token.
            * Cấu hình `SecurityWebFilterChain` để bảo vệ các endpoints nhạy cảm (mặc định chặn tất cả, trừ luồng đăng
              nhập `/login/**`).
        * **Cookie Transformation & Session Hiding:**
            * Đây là một tính năng bảo mật độc đáo của PICMA. Backend sử dụng `JSESSIONID` để quản lý phiên, nhưng
              Gateway **không bao giờ** trả cookie này về cho Client.
            * **Cơ chế:** Gateway sử dụng Filter (`GatewayFilter`) để chặn response, lấy `JSESSIONID`, mã hóa nó thành
              Base64, và gói vào một cookie mới tên là `PicmaIgCookie`. Khi Client gửi request lên, Gateway làm ngược
              lại: giải mã `PicmaIgCookie` thành `JSESSIONID` để gửi xuống các service dưới. -> **Kết quả:** Kẻ tấn công
              không thể biết cấu trúc session thực tế của server.
        * **Advanced Routing & Caching:**
            * Định tuyến động dựa trên đường dẫn (Path-based routing). Ví dụ: Request tới `/picma/users/**` sẽ được
              forward sang `USER-MGMT-SERVICE`.
            * **Local Response Cache:** Gateway được cấu hình để cache response cho các request đọc dữ liệu tĩnh (như
              danh sách user) trong thời gian ngắn (ví dụ: 3 phút) để giảm tải cho backend.
            * **Request/Response Decoration:** Tự động thêm/bớt Header (ví dụ: thêm `userType=agent`) để làm giàu
              context cho request trước khi xử lý.

3. **Cache Server (`picma-cache-server`)** - Port `6379`
    * **Vai trò:** Redis Server (In-memory Data Store) - Bộ nhớ đệm tốc độ cao.
    * **Công nghệ:** Redis 8.0 (Alpine Linux), chạy dưới dạng Docker Container.
    * **Tại sao cần service này?** Để giảm tải cho Database chính (PostgreSQL) và tăng tốc độ phản hồi cho người dùng.
    * **Chức năng chuyên sâu:**
        * **Distributed Session Store:** Trong kiến trúc Microservices, Gateway có thể được scale ra nhiều instance.
          Redis đóng vai trò là kho lưu trữ session tập trung. Dù user gửi request vào Gateway A hay Gateway B, hệ thống
          vẫn nhận diện được phiên đăng nhập.
        * **System Token Caching:** Các service backend thường xuyên phải gọi Keycloak để lấy Token quản trị (System
          Token) để thực hiện các tác vụ nền. Thay vì gọi Keycloak mỗi lần (chậm và tốn tài nguyên), Token được cache
          lại trong Redis với thời gian sống (TTL) tương ứng.
        * **Data Caching:** Cache các dữ liệu ít thay đổi nhưng được truy cập nhiều (như Danh sách Thành phố/Quận Huyện,
          cấu hình hệ thống) để phản hồi gần như tức thì.
        * **Cấu hình An toàn & Bền vững:**
            * **Password Protected:** Được bảo vệ bằng mật khẩu mạnh (cấu hình qua `requirepass`) để ngăn chặn truy cập
              trái phép.
            * **Persistence (Bền vững hóa):** Sử dụng Volume Mapping (`./.picma-storage/...`) để lưu dữ liệu xuống đĩa
              cứng. Ngay cả khi container bị restart hoặc sập, dữ liệu cache quan trọng không bị mất trắng.

### B. Security Services (Bảo mật & Người dùng)

Chịu trách nhiệm về xác thực tập trung và quản lý danh tính, hồ sơ người dùng trong hệ thống.

4. **User AuthNZ Service (`user-authnz-service`)** - Port `5052`
    * **Vai trò:** Authentication Facade - Ẩn giấu sự phức tạp của Keycloak.
    * **Tại sao cần service này?** PICMA không muốn Client phải gọi trực tiếp vào API của Keycloak (vốn phức tạp và yêu
      cầu nhiều tham số như `client_secret`). AuthNZ Service đóng vai trò là "Wrapper", cung cấp một API đơn giản, dễ
      dùng cho Frontend.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Authentication (Đăng nhập):**
            * Nhận `username` & `password` từ Client.
            * Sử dụng `Feign Client` để gửi yêu cầu `password grant` tới Keycloak (kèm `client_id`, `client_secret` được
              bảo mật tại backend).
            * Trả về `Access Token`, `Refresh Token` và thời gian hết hạn cho Gateway xử lý (đóng gói vào Cookie).
        * **Registration (Đăng ký):**
            * **Bước 1 - Lấy quyền:** Tự động gọi Keycloak để lấy **Client Credentials Token** (System Admin Token) -
              quyền cao nhất để được phép tạo user mới.
            * **Bước 2 - Tạo User:** Gọi Keycloak Admin API để tạo user với các thông tin cơ bản (`username`, `email`,
              `firstName`, `lastName`).
        * **Token Lifecycle:**
            * **Refresh:** Khi Access Token hết hạn, Client gọi endpoint `/auth/refresh` với Refresh Token cũ. Service
              này sẽ gọi Keycloak để cấp cặp token mới mà không cần user đăng nhập lại.
            * **Logout:** Gọi API của Keycloak để vô hiệu hóa Refresh Token ngay lập tức, đảm bảo an toàn nếu token bị
              lộ.

5. **User Management Service (`user-mgmt-service`)** - Port `5051`
    * **Vai trò:** Quản lý hồ sơ và quyền hạn người dùng (User & Group Management).
    * **Tại sao cần service này?** Mặc dù Keycloak quản lý identity, nhưng các logic nghiệp vụ (như "Agent nào thuộc
      Zipcode nào", "Chuyển user từ Owner sang Agent") cần được xử lý ở một tầng riêng. Service này hoạt động như một "
      Smart Proxy" trước Keycloak.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Stateless & Proxy Pattern:** Service hoàn toàn **không có Database riêng**. Mọi dữ liệu (User, Group, Role)
          đều được đọc/ghi trực tiếp vào Keycloak thông qua **Keycloak Admin API** (sử dụng Feign Client). Điều này đảm
          bảo tính nhất quán dữ liệu tuyệt đối (Single Source of Truth).
        * **Extended Attributes (Thuộc tính mở rộng):** Keycloak mặc định chỉ có các field cơ bản (email, first/last
          name). Service này tận dụng tính năng `attributes` (Map<String, List<String>>) của Keycloak để lưu trữ các
          thông tin nghiệp vụ tùy chỉnh.
            * Ví dụ: Lưu **ZipCode** của Agent vào attribute `zipcode`. Khi Lead được tạo, hệ thống sẽ query attribute
              này để tìm Agent phù hợp.
        * **Advanced Group Logic:**
            * **Group Switching (`switch-group`):** Cho phép Admin chuyển đổi vai trò người dùng (VD: Nâng cấp Owner
              thành Agent). Logic: Rời group cũ -> Vào group mới. Hệ thống cấu hình sẵn ID của các group `owners` và
              `agents` trong file config.
            * **Status Toggling (`update-status`):** Cho phép Admin khóa/mở khóa tài khoản ngay lập tức bằng cách update
              cờ `enabled` trong Keycloak User Entity.
            * **Priority Group Resolution:** Khi một User thuộc nhiều Group, hệ thống có logic ưu tiên để xác định vai
              trò hiển thị: `Admin` > `Agent` > `Owner`.

### C. Business Services (Nghiệp vụ)

Xử lý các logic nghiệp vụ cốt lõi của ứng dụng.

6. **Property Management Service (`property-mgmt-service`)** - Port `7101`
    * **Nhiệm vụ:** Quản lý hồ sơ tài sản (Property Portfolio).
    * **Tại sao cần service này?** Đặc thù của bảo hiểm tài sản là thông tin về ngôi nhà rất phức tạp và đa dạng (nhà
      cấp 4, chung cư, biệt thự...). Sử dụng Database truyền thống (SQL) có thể bị cứng nhắc.
    * **Cơ chế hoạt động chuyên sâu:**
        * **NoSQL Database (MongoDB):**
            * Service này sử dụng **MongoDB** (phiên bản 8.0) thay vì PostgreSQL.
            * Lý do: Để tận dụng tính linh hoạt của Schema (Flexible Schema). Điều này cho phép hệ thống dễ dàng mở rộng
              thêm các thuộc tính tài sản mới (ví dụ: "Có bể bơi không", "Vật liệu mái nhà") mà không cần migrate
              database phức tạp.
        * **Document Structure (Cấu trúc tài liệu):**
            * Mỗi tài sản được lưu dưới dạng một Document JSON hoàn chỉnh, không cần JOIN nhiều bảng.
            * Dữ liệu được tổ chức thành các Embedded Document: `Location` (Địa chỉ), `Attributes` (Kết cấu), và
              `Valuation` (Định giá).
            * **ZipCode Indexing:** Trường `zipCode` trong `Location` được đánh index để tối ưu hóa tốc độ tìm kiếm cho
              chức năng "Tìm kiếm tài sản theo khu vực" của Agent.
        * **Domain Model chi tiết:**
            * **Location:** `street`, `ward`, `city`, `zipCode`.
            * **Attributes:** `ConstructionType` (Gỗ, Gạch...), `OccupancyType` (Để ở, Cho thuê...), `yearBuilt`,
              `noFloors`, `squareMeters`.
            * **Valuation:** `estimatedConstructionCost`.
        * **Endpoints chính:**
            * `POST /propertyInfo`: Lưu trữ tài sản dưới dạng Document mới.
            * `GET /propertyInfo/zipcode/{zipcode}`: Query MongoDB để tìm tất cả tài sản trong một ZipCode cụ thể.
            * `GET /propertyInfo/{propertyId}`: Lấy document theo ID (ObjectId).

7. **Property Lead Service (`property-lead-service`)** - Port `7103`
    * **Nhiệm vụ:** Quản lý vòng đời yêu cầu bảo hiểm (Lead Lifecycle Management).
    * **Tại sao cần service này?** Đây là "bộ não" điều phối trạng thái của một cơ hội kinh doanh. Nó đảm bảo một Lead
      không bị bỏ quên (tự động hết hạn) và phân phối thông tin đến các Agent.
    * **Cơ chế hoạt động chuyên sâu:**
        * **State Machine (Máy trạng thái):** Quản lý chặt chẽ việc chuyển đổi trạng thái của Lead:
            * `ACTIVE`: Vừa mới tạo, chưa có Agent nào xử lý.
            * `IN_REVIEWING`: Đã có Agent đánh dấu "Quan tâm" (`INTERESTED`).
            * `ACCEPTED`: Chủ nhà đã đồng ý mua bảo hiểm từ một Agent.
            * `REJECTED`: Chủ nhà từ chối hoặc hủy yêu cầu.
            * `EXPIRED`: Tự động chuyển sang trạng thái này nếu sau **30 ngày** không có hoạt động nào.
        * **Event-Driven Architecture (Kiến trúc hướng sự kiện):**
            * Ngay khi Lead được tạo (`ACTIVE`), service sử dụng `KafkaTemplate` để bắn một message JSON chứa thông tin
              Lead vào topic `property-lead-topic`.
            * Key của message là `propertyInfoId` để đảm bảo thứ tự xử lý (ordering) nếu cần thiết.
        * **Agent Matching Logic:**
            * Cung cấp endpoint `GET /property-lead/agent/{agentId}` để tìm các Lead phù hợp cho một Agent cụ thể. Logic
              này dựa trên việc so khớp Zipcode của Agent với Zipcode của tài sản (thông qua việc gọi sang
              `property-mgmt-service`).

8. **Property Agent Service (`property-agent-service`)** - Port `7104`
    * **Nhiệm vụ:** Quản lý mạng lưới Agent và cơ chế phân phối Lead.
    * **Tại sao cần service này?** Tách biệt logic tìm kiếm Agent ra khỏi logic tạo Lead để đảm bảo hiệu năng. Nếu việc
      tìm Agent mất 10 giây, người dùng (Owner) không bị treo màn hình chờ.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Kafka Consumer (Xử lý bất đồng bộ):**
            * Service này lắng nghe topic `property-lead-topic`.
            * Khi nhận được message "Lead mới", nó tự động kích hoạt quy trình "Matching".
        * **Matching Algorithm (Thuật toán khớp lệnh):**
            * Trích xuất ZipCode từ thông tin tài sản của Lead.
            * Query Database (`UserAddressRepo`) để tìm tất cả Agent đã đăng ký hoạt động tại ZipCode đó.
            * Kết quả: Danh sách các Agent phù hợp.
        * **Notification Dispatching:**
            * Sau khi tìm được danh sách Agent, service gửi yêu cầu sang `notification-service` để bắn thông báo (
              Real-time Alert) tới từng Agent: "Có khách hàng mới trong khu vực của bạn!".
        * **Agent Interaction Tracking:**
            * Quản lý bảng `agent_lead` để lưu trạng thái tương tác của từng Agent với từng Lead.
            * **Quy tắc 7 ngày:** Có một Scheduled Task chạy định kỳ để kiểm tra. Nếu Agent đã đánh dấu "Quan tâm" nhưng
              không gửi báo giá trong vòng 7 ngày, hệ thống sẽ tự động chuyển trạng thái tương tác thành `REJECTED` để
              nhường cơ hội cho người khác hoặc đóng Lead.

9. **Property Quote Service (`property-quote-service`)** - Port `7102`
    * **Nhiệm vụ:** Quản lý và tính toán báo giá bảo hiểm (Quotation Engine).
    * **Tại sao cần service này?** Báo giá là thực thể phức tạp nhất trong bảo hiểm, bao gồm nhiều gói (Plan), quyền
      lợi (Coverage) và logic tính phí (Premium). Nó cần được tách riêng để đảm bảo tính toàn vẹn của hợp đồng.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Domain Model (Mô hình nghiệp vụ):**
            * **Plan Type:** Hỗ trợ các gói bảo hiểm tiêu chuẩn (`SILVER`, `GOLD`, `PLATINUM`).
            * **Coverage:** Danh sách các quyền lợi chi tiết (Ví dụ: Cháy nổ, Trộm cắp, Lũ lụt) đi kèm với hạn mức bồi
              thường (Limit) và mức miễn thường (Deductible).
            * **Premium:** Tính toán phí bảo hiểm gồm Phí thuần (Net Premium), Thuế (Tax) và Tổng phí (Total).
        * **Quote Lifecycle (Vòng đời báo giá):**
            * **Draft/Created:** Agent tạo báo giá dựa trên thông tin Lead. Hệ thống tự động đặt ngày hết hạn (
              `validUntil`) là 30 ngày.
            * **Accepted:** Khi Owner chấp nhận báo giá -> Service sẽ gọi sang `property-lead-service` để đổi trạng thái
              Lead thành `ACCEPTED`.
            * **Rejected:** Nếu Owner từ chối -> Service gọi sang `property-agent-service` để cập nhật hành động của
              Agent là `REJECTED`.
        * **Validation:** Đảm bảo một Agent chỉ có thể tạo báo giá cho Lead mà họ đã đánh dấu "Quan tâm".

10. **Notification Service (`notification-service`)** - Port `7105`
    * **Nhiệm vụ:** Trung tâm thông báo tập trung (Centralized Notification Hub).
    * **Tại sao cần service này?** Để tránh việc các service khác (như Quote, Agent) phải tự quản lý logic thông báo,
      chúng chỉ cần gửi sự kiện. Notification Service sẽ lo việc lưu trữ và phân phối đến người dùng cuối.
    * **Cơ chế hoạt động chuyên sâu:**
        * **Kafka Listener:**
            * Lắng nghe topic `notification-topic` từ Kafka.
            * Bất kỳ service nào muốn gửi thông báo chỉ cần produce một message JSON (chứa `recipientId`, `title`,
              `message`) vào topic này.
        * **Persistent Storage (Lưu trữ bền vững):**
            * Mọi thông báo đều được lưu vào Database để người dùng có thể xem lại lịch sử.
            * Trạng thái `isRead` (đã đọc/chưa đọc) được quản lý để hiển thị badge số lượng thông báo mới trên Frontend.
        * **API-based Delivery:**
            * Cung cấp các API RESTful để Frontend polling (lấy danh sách thông báo, đánh dấu đã đọc):
                * `GET /notifications/{recipientId}`: Lấy danh sách thông báo (sắp xếp mới nhất trước).
                * `GET /notifications/{recipientId}/unread-count`: Đếm số thông báo chưa đọc.
                * `PUT /notifications/{id}/read`: Đánh dấu đã đọc.

### D. Frontend (`webapp-service`)

* **Port:** `5173`.
* **Công nghệ:** React 18, TypeScript, Vite, Tailwind CSS v4, Shadcn UI (Radix Primitives).
* **Tại sao cấu trúc này?** PICMA Frontend không tổ chức theo kiểu Layer (Components/Pages/Services) truyền thống mà
  theo **Vertical Slice Architecture** (Kiến trúc cắt dọc). Mỗi tính năng lớn (Admin, Agent, Owner) là một module độc
  lập, chứa đầy đủ components, hooks, và services riêng. Điều này giúp code dễ bảo trì khi dự án phình to.
* **Cơ chế hoạt động chuyên sâu:**
    * **Authentication & Security:**
        * Sử dụng **Context API** (`AuthContext`) để quản lý trạng thái đăng nhập toàn cục.
        * **Axios Interceptor:** Mọi request gửi đi từ Frontend đều tự động được chèn `Authorization: Bearer <token>`
          lấy từ `sessionStorage`. Nếu nhận lỗi 401 (Unauthorized), hệ thống tự động logout và redirect về trang Login.
        * **RBAC (Role-Based Access Control):** Các Route được bảo vệ bởi wrapper `<ProtectedRoute />`, kiểm tra role
          của user (Admin/Agent/Owner) trước khi render component.
    * **State Management:**
        * **Server State:** Sử dụng **TanStack Query (React Query)** để quản lý dữ liệu từ API. Giúp cache dữ liệu, tự
          động fetch lại (refetch) khi cửa sổ focus, và xử lý loading/error state một cách mượt mà.
        * **Client State:** Sử dụng **React Context** cho các trạng thái toàn cục đơn giản (Theme Light/Dark, Auth
          User).
    * **UI/UX Philosophy:**
        * **Mobile-First & Responsive:** Giao diện tối ưu cho cả Desktop và Mobile.
        * **Data Visualization:** Sử dụng thư viện `recharts` để vẽ biểu đồ thống kê (Line chart cho xu hướng Lead, Pie
          chart cho tỉ lệ trạng thái).
        * **Forms:** Sử dụng `react-hook-form` kết hợp với `zod` để validate dữ liệu đầu vào chặt chẽ ngay từ phía
          client.

---

## 3. Danh sách quy trình nghiệp vụ (System Workflows)

### A. Quản lý Người dùng & Bảo mật (User Management & Security)

#### 1. Đăng ký tài khoản (Self-Registration)

* **Diễn viên:** Người dùng vãng lai (Guest).
* **Mô tả:** Người dùng tự tạo tài khoản để trở thành Owner hoặc Agent.
* **Các bước:**
    1. Frontend gửi thông tin (username, password, email, role) đến `user-authnz-service`.
    2. `user-authnz-service` xác thực bằng System Admin Token.
    3. Gọi Keycloak Admin API để tạo User.
    4. Gán User vào Group tương ứng (Agent hoặc Owner) để phân quyền.

#### 2. Quản trị viên tạo người dùng (Admin User Creation)

* **Diễn viên:** Admin.
* **Mô tả:** Admin tạo tài khoản thủ công cho Agent hoặc Owner từ Dashboard.
* **Các bước:**
    1. Admin điền form trên Dashboard.
    2. Frontend gọi API `POST /user` của `user-mgmt-service`.
    3. Service thực hiện quy trình tương tự Self-Registration nhưng bỏ qua bước xác thực email (mặc định verify).

#### 3. Chuyển đổi vai trò (Role Switching)

* **Diễn viên:** Admin.
* **Mô tả:** Nâng cấp một Property Owner thành Agent (hoặc ngược lại).
* **Các bước:**
    1. Admin chọn user và bấm "Switch Group".
    2. `user-mgmt-service` nhận request -> Gọi Keycloak để remove user khỏi Group hiện tại (`owners`).
    3. Add user vào Group mới (`agents`).

#### 4. Kích hoạt/Vô hiệu hóa tài khoản (User Activation)

* **Diễn viên:** Admin.
* **Mô tả:** Khóa tài khoản vi phạm hoặc mở khóa.
* **Các bước:**
    1. Admin toggle trạng thái Active/Inactive.
    2. `user-mgmt-service` gọi Keycloak API để update cờ `enabled`.
    3. Token của user sẽ bị vô hiệu hóa ngay lập tức (nếu Keycloak cấu hình revoke policy).

---

### B. Quản lý Tài sản & Nhu cầu (Property & Lead Management)

#### 5. Đăng ký tài sản (Property Creation)

* **Diễn viên:** Owner.
* **Mô tả:** Chủ nhà khai báo thông tin ngôi nhà cần bảo hiểm.
* **Các bước:**
    1. Owner điền form (Địa chỉ, Zipcode, Kết cấu nhà).
    2. Frontend gọi `property-mgmt-service` lưu vào MongoDB.
    3. Hệ thống trả về `propertyId`.

#### 6. Tạo yêu cầu bảo hiểm (Lead Generation)

* **Diễn viên:** Owner.
* **Mô tả:** Chủ nhà tạo yêu cầu mua bảo hiểm cho một tài sản đã đăng ký.
* **Các bước:**
    1. Owner chọn tài sản và bấm "Request Insurance".
    2. `property-lead-service` tạo bản ghi Lead với trạng thái `ACTIVE`.
    3. **Kích hoạt sự kiện:** Bắn message `LeadCreatedEvent` vào Kafka topic `property-lead-topic`.

#### 7. Phân phối Lead tự động (Lead Distribution)

* **Diễn viên:** Hệ thống (System).
* **Mô tả:** Tìm kiếm Agent phù hợp để gửi thông báo.
* **Các bước:**
    1. `property-agent-service` (Kafka Consumer) nhận message từ Kafka.
    2. Trích xuất Zipcode từ Lead.
    3. Query tìm danh sách Agent hoạt động tại Zipcode đó.
    4. Gọi `notification-service` để gửi Alert cho các Agent tìm được.

#### 8. Lead tự động hết hạn (Lead Expiration)

* **Diễn viên:** Hệ thống (Scheduled Task).
* **Mô tả:** Dọn dẹp các Lead treo quá lâu.
* **Các bước:**
    1. Cron job chạy mỗi ngày (ví dụ: 0h00).
    2. Quét các Lead có trạng thái `ACTIVE` quá 30 ngày.
    3. Chuyển trạng thái sang `EXPIRED`.
    4. Gửi thông báo cho Owner: "Yêu cầu của bạn đã hết hạn".

---

### C. Báo giá & Chốt hợp đồng (Quoting & Binding)

#### 9. Agent tương tác (Agent Interest)

* **Diễn viên:** Agent.
* **Mô tả:** Agent xem Lead và xác nhận muốn phục vụ.
* **Các bước:**
    1. Agent bấm "I'm Interested".
    2. `property-agent-service` ghi nhận tương tác.
    3. Cập nhật trạng thái Lead sang `IN_REVIEWING` (nếu đây là Agent đầu tiên).
    4. Chủ nhà nhận thông báo: "Có Agent đang xem hồ sơ của bạn".

#### 10. Agent gửi báo giá (Quote Creation)

* **Diễn viên:** Agent.
* **Mô tả:** Agent tính phí và gửi gói bảo hiểm.
* **Các bước:**
    1. Agent chọn Plan (Silver/Gold...) và điều chỉnh hạn mức.
    2. `property-quote-service` tính toán Premium (Net + Tax).
    3. Lưu Quote với trạng thái `DRAFT` (hoặc `SENT`).
    4. Cập nhật trạng thái tương tác của Agent thành `ACCEPTED` (đã báo giá).

#### 11. Chấp nhận báo giá (Quote Acceptance)

* **Diễn viên:** Owner.
* **Mô tả:** Chủ nhà đồng ý mua bảo hiểm theo báo giá.
* **Các bước:**
    1. Owner so sánh các báo giá và bấm "Accept" một cái.
    2. `property-quote-service` xử lý:
        * Cập nhật Quote đó thành `ACCEPTED`.
        * Gọi `property-lead-service` chuyển Lead thành `ACCEPTED`.
    3. Quy trình kết thúc thành công.

#### 12. Từ chối báo giá (Quote Rejection)

* **Diễn viên:** Owner.
* **Mô tả:** Chủ nhà không hài lòng với báo giá.
* **Các bước:**
    1. Owner bấm "Reject".
    2. Quote chuyển sang trạng thái `REJECTED`.
    3. Trạng thái tương tác của Agent đó chuyển thành `REJECTED`.
    4. Lead vẫn giữ nguyên trạng thái để chờ các Agent khác.

---

## 4. Công nghệ sử dụng (Technology Stack)

| Hạng mục              | Công nghệ chi tiết                                           |
|:----------------------|:-------------------------------------------------------------|
| **Backend Language**  | Java 17+                                                     |
| **Framework**         | Spring Boot 3.5.7, Spring Cloud (Eureka, Gateway, OpenFeign) |
| **Database**          | PostgreSQL (Dữ liệu nghiệp vụ), Redis (Caching)              |
| **Message Broker**    | Apache Kafka                                                 |
| **Identity Provider** | Keycloak                                                     |
| **Frontend**          | React, TypeScript, Vite, Tailwind CSS v4, React Query        |
| **Build Tool**        | Maven (Backend), NPM (Frontend)                              |
| **Containerization**  | Docker, Docker Compose                                       |

## 5. Cấu trúc thư mục (Directory Structure)

```text
/
├── business-services/       # Chứa các service nghiệp vụ (Lead, Quote, Property, Agent...)
├── infrastructure-services/ # Chứa Gateway, Registry, Cache server
├── security-services/       # Chứa User AuthNZ, User Mgmt
├── webapp-service/          # Source code Frontend (React)
├── docker-compose-picma.yml # File cấu hình chạy toàn bộ hệ thống bằng Docker
└── README.md                # Tài liệu dự án
```