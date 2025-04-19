import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Spinner, Accordion, Table, Badge } from "react-bootstrap";
import Navbar from "./components/Navbar";

const CheckTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper untuk status badge
  const getStatusBadge = (status) => {
    const variant = {
      success: "success",
      pending: "warning",
      failed: "danger",
    }[status.toLowerCase()] || "secondary";
    return <Badge bg={variant} className="text-capitalize">{status}</Badge>;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 3. Filter hanya transaksi milik user
        const myTrans = await axios.get('https://toko369-be-production.up.railway.app/api/transaction/fetch/customer', {withCredentials:true});
        setTransactions(myTrans.data);
      } catch (err) {
        alert(e.response?.data?.message + " Hubungi admin apabila error!");
        if(e.response.data.message.includes("No token provided")){
            navigate('/')
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar setSearchQuery={()=>{}} userRole="customer" />
        <Container className="text-center my-5">
          <Spinner animation="border" />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar showSearchBar={false}/>

      <Container className="my-4">
        <h3 className="mb-4">Riwayat Transaksi Anda</h3>

        {transactions.length === 0 ? (
          <p>Belum ada transaksi.</p>
        ) : (
          <Accordion defaultActiveKey="">
            {transactions.map((trx, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={trx.transaction_id}>
                <Accordion.Header>
                  <span className="me-3">
                    <strong>ID:</strong> {trx.transaction_id}
                  </span>
                  {getStatusBadge(trx.status)}
                </Accordion.Header>
                <Accordion.Body>
                  <Table bordered hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>ID Produk</th>
                        <th>Unit</th>
                        <th>Harga (Rp)</th>
                        <th>Qty</th>
                        <th>Subtotal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trx.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.product_id}</td>
                          <td>{item.unit}</td>
                          <td>{item.price.toLocaleString("id-ID")}</td>
                          <td>{item.quantity}</td>
                          <td>
                            {(item.price * item.quantity).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="text-end">
                    <strong>Total: Rp {trx.total.toLocaleString("id-ID")}</strong>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Container>
    </>
  );
};

export default CheckTransactionPage;